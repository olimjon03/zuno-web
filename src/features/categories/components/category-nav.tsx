import { categories } from "@/features/listings/constants";
import type { Category } from "@/features/listings/types";
import { Icon, type IconName } from "@/components/ui/icon";
const icons: IconName[] = ["list", "briefcase", "home", "user", "people", "book", "plus"];
export function CategoryNav({
  selected,
  onChange,
}: {
  selected: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <nav className="category-nav" aria-label="Marketplace categories">
      {categories.map((category, index) => (
        <button
          key={category}
          aria-pressed={selected === category}
          className={selected === category ? "selected" : ""}
          onClick={() => onChange(category)}
        >
          <Icon name={icons[index]}/>
          {category}
        </button>
      ))}
    </nav>
  );
}
