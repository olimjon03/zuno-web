"use client";
import { Text, useT } from "@/features/language/provider";
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
  const t = useT();
  return (
    <nav className="category-nav" aria-label={t("Marketplace categories")}>
      {categories.map((category, index) => (
        <button
          key={category}
          aria-pressed={selected === category}
          className={selected === category ? "selected" : ""}
          onClick={() => onChange(category)}
        >
          <Icon name={icons[index]}/>
          <Text>{category}</Text>
        </button>
      ))}
    </nav>
  );
}
