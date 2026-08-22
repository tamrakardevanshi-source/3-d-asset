import './App.css';
import ThreeViewer from './components/ThreeViewer.jsx';

function App() {
  const resetView = () => {
    window.dispatchEvent(new Event('reset-camera'));
  };

  return (
    <div className="app">

      {/* 3D Viewer */}
      <ThreeViewer />

      {/* Top Header */}
      <header className="viewer-header">
        <div>
          <p className="eyebrow">3D ASSET VIEWER</p>
          <h1>Donut Shop</h1>
        </div>

        <div className="format-badge">
          GLB
        </div>
      </header>

      {/* Instructions */}
      <div className="interaction-hint">
        <span>🖱️ Drag to rotate</span>
        <span>🔍 Scroll to zoom</span>
        <span>↔️ Right-drag to pan</span>
      </div>

      {/* Information Card */}
      <aside className="info-card">

        <div className="card-header">
          <div>
            <p className="card-label">ORIGINAL 3D ASSET</p>
            <h2>Donut Shop</h2>
          </div>

          <div className="status-dot">
            <span></span>
            Ready
          </div>
        </div>

        <p className="description">
          A stylized miniature donut shop created as an original
          3D asset and exported in GLB format for web-based
          interactive viewing.
        </p>

        <div className="details">

          <div className="detail">
            <span>Format</span>
            <strong>.GLB</strong>
          </div>

          <div className="detail">
            <span>Created With</span>
            <strong>Tinkercad</strong>
          </div>

          <div className="detail">
            <span>Viewer</span>
            <strong>Three.js</strong>
          </div>

          <div className="detail">
            <span>Interaction</span>
            <strong>OrbitControls</strong>
          </div>

        </div>

        <button
          className="reset-button"
          onClick={resetView}
        >
          ↻ Reset View
        </button>

      </aside>

      {/* Bottom branding */}
      <div className="viewer-footer">
        <span>Original Asset</span>
        <span>•</span>
        <span>Interactive 3D Experience</span>
      </div>

    </div>
  );
}

export default App;