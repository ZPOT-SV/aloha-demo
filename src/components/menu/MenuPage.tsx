import { useEffect, useMemo, useState } from 'react';

import menuData from '../../data/menu.json';
import type { MenuItem, MenuParentCategory, MenuSubCategory } from '../../types';
import MenuItemCard from '../MenuItemCard';

const items = menuData as MenuItem[];

const parentTabs: Array<{ id: MenuParentCategory; label: string }> = [
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'bowls', label: 'Bowls' },
  { id: 'temporada', label: 'Temporada' }
];

const subCatsForTab: Record<MenuParentCategory, MenuSubCategory[]> = {
  bebidas: ['cafes', 'jugos'],
  bowls: ['dragon-fruit', 'acai', 'banana'],
  temporada: []
};

const subCategoryLabels: Record<MenuSubCategory, string> = {
  cafes: 'Cafés',
  jugos: 'Jugos',
  'dragon-fruit': 'Dragon Fruit',
  acai: 'Açaí',
  banana: 'Banana',
  temporada: 'Temporada'
};

function getInitialCategory(): MenuParentCategory {
  if (typeof window === 'undefined') {
    return 'bebidas';
  }

  const categoria = new URLSearchParams(window.location.search).get('categoria');
  return categoria === 'bowls' || categoria === 'temporada' ? categoria : 'bebidas';
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<MenuParentCategory>(getInitialCategory);
  const [activeSubCategory, setActiveSubCategory] = useState<MenuSubCategory | null>(null);

  const currentSubCats = useMemo(() => {
    return subCatsForTab[activeCategory].filter((subCategory) =>
      items.some((item) => item.category === activeCategory && item.subCategory === subCategory)
    );
  }, [activeCategory]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.category === activeCategory)
      .filter((item) => (activeSubCategory === null ? true : item.subCategory === activeSubCategory));
  }, [activeCategory, activeSubCategory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('categoria', activeCategory);

    if (activeSubCategory === null) {
      params.delete('subcategoria');
    } else {
      params.set('subcategoria', activeSubCategory);
    }

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', nextUrl);
  }, [activeCategory, activeSubCategory]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mt-6 mb-4 flex flex-wrap gap-3" id="menu-category-tabs">
        {parentTabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-full border border-brand px-4 py-2 text-sm font-bold transition hover:bg-brand hover:text-white ${
              activeCategory === tab.id ? 'bg-brand text-white shadow-lg shadow-brand/15' : 'text-brand'
            }`}
            onClick={() => {
              setActiveCategory(tab.id);
              setActiveSubCategory(null);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {currentSubCats.length > 0 ? (
        <nav className="mt-6 mb-4 flex flex-wrap gap-3">
          {currentSubCats.map((subCat) => (
            <button
              key={subCat}
              className={`rounded-full border border-brand/20 px-4 py-2 text-sm font-bold transition hover:border-brand hover:text-brand ${
                activeSubCategory === subCat ? 'bg-slate-950 text-white' : 'text-text-muted'
              }`}
              onClick={() => setActiveSubCategory(subCat)}
              type="button"
            >
              {subCategoryLabels[subCat]}
            </button>
          ))}
        </nav>
      ) : null}

      <div className="grid grid-cols-3 gap-6" id="menu-grid">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
