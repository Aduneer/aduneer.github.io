(() => {
  const map = document.querySelector('.hole-thread-map');
  if (!map) return;

  const nodes = Array.from(map.querySelectorAll('.hole-map-node'));
  const paths = Array.from(map.querySelectorAll('.hole-map-lines path'));
  const indexLabel = map.querySelector('[data-map-index]');
  const heading = map.querySelector('[data-map-heading]');
  const description = map.querySelector('[data-map-description]');
  const link = map.querySelector('[data-map-link]');

  const selectThread = (selected, index) => {
    nodes.forEach((node, nodeIndex) => node.setAttribute('aria-pressed', String(nodeIndex === index)));
    paths.forEach((path, pathIndex) => path.classList.toggle('is-active', pathIndex === index));
    indexLabel.textContent = String(index + 1).padStart(2, '0');
    heading.textContent = selected.dataset.mapTitle;
    description.textContent = selected.dataset.mapCopy;
    link.href = selected.dataset.mapHref;
    link.textContent = `${selected.dataset.mapLabel} ↗`;
  };

  nodes.forEach((node, index) => node.addEventListener('click', () => selectThread(node, index)));
  const initialIndex = Math.max(0, nodes.findIndex((node) => node.getAttribute('aria-pressed') === 'true'));
  if (nodes.length) selectThread(nodes[initialIndex], initialIndex);
})();
