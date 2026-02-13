# Motions do Graph View (Referência e Estrutura)

Estrutura de animações e comportamentos inspirada em GraphView (Obsidian, D3, Cytoscape), aplicada ao board atual.

---

## 1. Dinâmica e Física Base (Motions Contínuos)

- **Força de repulsão:** nós como mesma polaridade, expansão orgânica ao adicionar nó no centro.
- **Força de atração (molas/links):** arestas como molas (comprimento ideal); vai-e-vem elástico até equilíbrio.
- **Gravidade/centro de massa:** força sutil puxando nós para o centro (evita “ilhas” flutuando).
- **Atrito e resfriamento (alpha decay):** damping que desacelera ao longo do tempo; motion final = estabilização suave.

**No projeto:** layout orbital fixo em volta do hub (brain); opcionalmente D3-force/CloudLayout para simulação contínua.

---

## 2. Comportamentos Interativos

### Drag & Drop
- Nó arrastado: coordenadas travadas (pinned) ou “massa infinita”.
- Ao soltar: pode ficar fixo ou a física puxar de volta.
- **No projeto:** `onNodeDragStop` atualiza posição no store; cards arrastáveis quando `!readOnly`.

### Hover e foco
- Nó em hover: leve scale-up; vizinhança em destaque.
- Nós/arestas não conectados: fade-out (opacidade reduzida).
- Arestas conectadas: cor mais forte e mais espessas, transição suave.
- **No projeto:** ContentCard/FolderCard com `whileHover` (scale, glow); borda em hover = `primary-300`.

### Zoom e panning
- Pan: move câmera sem alterar física.
- Zoom semântico: ao afastar, rótulos fade-out; ao aproximar, detalhes/ícones/textos aparecem.
- **No projeto:** React Flow `minZoom`/`maxZoom`; opcional: esconder/mostrar textos por nível de zoom.

---

## 3. Animações de Transição de Estado (Micro-Motions)

### Entrada e saída de nós (Enter/Exit)
- **Inserção:** pop-in — escala 0 → 1.1 → 1 (spring/bounce).
- **Remoção:** escala → 0 ou “implosão”; arestas com stroke-dasharray recolhendo.
- **No projeto:** nós com `initial={{ scale: 0 }}` e `animate={{ scale: 1 }}` (spring) nos wrappers de node.

### Expandir/colapsar (clustering)
- Colapsar: filhos animam posição para o centro do pai e opacidade → 0.
- Expandir: filhos “saindo” do centro do pai; repulsão reativada.
- **No projeto:** FolderCard com burst de filhos (Framer Motion); `toggleFolder` expand/collapse.

### Fluxo direcional (edge particles)
- Partículas ou traços ao longo da aresta (origem → destino).
- **No projeto:** arestas hub→cards com `stroke-dasharray` + animação `obsidian-edge-flow` (traço em movimento).

---

## 4. Mudança de Layout (Morfismo)

- Alternar entre layout de força (orgânico), hierárquico (árvore) ou circular (radial).
- Física desligada; novas (x,y) calculadas; interpolação com easing (e.g. easeInOutCubic).
- **No projeto:** layout orbital fixo; possível evoluir para alternância força ↔ orbital.

---

## Implementação atual

| Motion                    | Onde está / como |
|---------------------------|-------------------|
| Órbita ao redor do brain  | `getOrbitalPosition`, layout no Canvas e ao criar card |
| Linhas hub→cards          | Arestas tipo `obsidian` (BezierEdge) + CSS animado |
| Hover nos cards           | `whileHover` (scale, glow, borda primary-300) |
| Enter nó                  | Animação de escala nos node wrappers (pop-in) |
| Drag e persistência        | `onNodeDragStop` + `updateCard` |
| Expandir pasta            | FolderCard burst + `toggleFolder` |

Bibliotecas: React Flow (nós, arestas, zoom, pan), Framer Motion (hover, enter, burst), CSS (animação de traço nas arestas).
