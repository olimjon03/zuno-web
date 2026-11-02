import { categories, type Category } from "@/features/listings/sample-listings";
export function CategoryNav({
  selected,
  onChange,
}: {
  selected: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <nav className="category-nav" aria-label="Marketplace categories">
      {categories.map((category) => (
        <button
          key={category}
          aria-pressed={selected === category}
          className={selected === category ? "selected" : ""}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
