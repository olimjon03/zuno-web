import AppKit
import AVFoundation
import CoreVideo

let args = CommandLine.arguments
if args.count < 4 { fatalError("Usage: render output.mp4 image1 image2 [image3]") }
let output = URL(fileURLWithPath: args[1])
let images: [CGImage] = args.dropFirst(2).map { path in
    guard let image = NSImage(contentsOfFile: path), let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("Cannot read image") }
    return cg
}
let width = 960, height = 540, fps = 24, frames = 192
try? FileManager.default.removeItem(at: output)
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width, AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 1_200_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264MainAutoLevel, AVVideoMaxKeyFrameIntervalKey: 48]
])
input.expectsMediaDataInRealTime = false
writer.add(input)
let attributes: [String: Any] = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height, kCVPixelBufferCGImageCompatibilityKey as String: true, kCVPixelBufferCGBitmapContextCompatibilityKey as String: true]
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attributes)
guard writer.startWriting() else { fatalError("Cannot start writer: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)
func draw(_ image: CGImage, context: CGContext, progress: Double, alpha: Double) {
    let scale = max(Double(width)/Double(image.width), Double(height)/Double(image.height)) * (1.03 + 0.055 * progress)
    let w = Double(image.width)*scale, h = Double(image.height)*scale
    context.saveGState()
    context.setAlpha(alpha)
    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: (Double(width)-w)/2 + sin(progress * .pi)*6, y: (Double(height)-h)/2, width: w, height: h))
    context.restoreGState()
}
for frame in 0..<frames {
    while !input.isReadyForMoreMediaData { if writer.status == .failed { fatalError("Encoder failed") }; Thread.sleep(forTimeInterval: 0.002) }
    var buffer: CVPixelBuffer?
    CVPixelBufferCreate(kCFAllocatorDefault, width, height, kCVPixelFormatType_32BGRA, attributes as CFDictionary, &buffer)
    guard let pixel = buffer else { fatalError("No pixel buffer") }
    CVPixelBufferLockBaseAddress(pixel, [])
    guard let context = CGContext(data: CVPixelBufferGetBaseAddress(pixel), width: width, height: height, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixel), space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue) else { fatalError("No drawing context") }
    let time = Double(frame)/Double(fps), segment = 8.0/Double(images.count)
    let slot = min(images.count-1, Int(time/segment)), local = time - Double(slot)*segment
    let blend = max(0, min(1, (local-(segment-0.7))/0.7))
    let eased = blend*blend*(3-2*blend)
    draw(images[slot], context: context, progress: local/segment, alpha: 1)
    if eased > 0 { draw(images[(slot+1)%images.count], context: context, progress: 0, alpha: eased) }
    CVPixelBufferUnlockBaseAddress(pixel, [])
    guard adaptor.append(pixel, withPresentationTime: CMTime(value: Int64(frame), timescale: Int32(fps))) else { fatalError("Cannot append: \(String(describing: writer.error))") }
}
input.markAsFinished()
let finished = DispatchSemaphore(value: 0)
writer.finishWriting { finished.signal() }
finished.wait()
guard writer.status == .completed else { fatalError("Encoding failed: \(String(describing: writer.error))") }
print("Rendered \(output.lastPathComponent): 8s H.264, 960x540, 24 fps")
