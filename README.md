# Keyword Paste Splitter 1.0.5.0

OJS 3.5.0-5 LTS generic plugin. A Metaadatok → Kulcsszavak mezőbe beillesztett, vesszővel, pontosvesszővel vagy sortöréssel elválasztott szöveget külön kulcsszóelemekké alakítja.

## 1.0.5.0

- Hozzáadva a szabványos angol, magyar és német lokalizáció.
- A bővítmény neve és leírása most már helyesen jelenik meg a bővítménylistában.

## 1.0.4.0

- Csak a működő közvetlen Vue-komponensmódszert használja.
- Eltávolítva a billentyűzetes eseményszimuláció és a hozzá tartozó késleltetett tartalék kód.
- A kulcsszavakat egyetlen `setSelected()` hívással adja át az OJS mezőnek.
- Új asset-azonosító és verziózott JavaScript URL akadályozza meg a régi fájl gyorsítótárazását.
