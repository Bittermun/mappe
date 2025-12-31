# Ruhr 1936 Tactical Map

A stylized topographical map visualization of the Ruhr Valley, featuring:

- **Dual-mode view**: Satellite tiles vs tactical contour overlay
- **Cityscape layers**: Glowing orange roads, buildings, and urban areas
- **Contour lines**: Dim cyan/blue terrain elevation lines
- **Interactive controls**: Sliders for opacity, width, glow intensity

## Tech Stack
- [MapLibre GL JS](https://maplibre.org/) - Vector map rendering
- [maplibre-contour](https://github.com/onthegomap/maplibre-contour) - DEM-based contour generation
- [Vite](https://vitejs.dev/) - Build tool
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

## Screenshot
![Tactical Map](docs/screenshot.png)

## License
MIT
