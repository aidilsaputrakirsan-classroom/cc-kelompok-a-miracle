function AboutPage({ onBack }) {
  const team = [
    { name: "Debora Intania Subekti", nim: "10231029", role: "Lead Backend" },
    { name: "Yosan Pratiwi", nim: "10231091", role: "Lead Frontend" },
    { name: "Avhilla Catton Andalucia", nim: "10231021", role: "Lead DevOps" },
    { name: "Chelsy Olivia", nim: "10231025", role: "Lead CI/CD & Deploy" },
    { name: "Betran", nim: "10231023", role: "Lead QA & Docs" },
  ]

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: "20px" }}>
        ← Kembali
      </button>
      <h1>About This Project</h1>
      <p>Aplikasi Cloud-Native yang dibangun untuk mata kuliah Komputasi Awan.</p>
      
      <h2>Tech Stack</h2>
      <ul>
        <tr><td><i>FastAPI</i></td><td>Backend REST API</td></tr>
          <tr><td><i>React</i></td><td>Frontend SPA</td></tr>
          <tr><td><i>PostgreSQL</i></td><td>Database</td></tr>
          <tr><td><i>Docker</i></td><td>Containerization</td></tr>
          <tr><td><i>GitHub Actions</i></td><td>CI/CD</td></tr>
          <tr><td><i>Railway/Render</i></td><td>Cloud Deployment</td></tr>
      </ul>

      <h2>Miracle</h2>
    <table border="1" cellPadding="8" cellSpacing="0">
    <thead>
        </thead>
        <tbody><tr>
            <td>Debora Intania Subekti</td><td>10231029</td><td>Lead Backend</td></tr><tr>
            <td>Yosan Pratiwi</td><td>10231091</td><td>Lead Frontend</td></tr><tr>
            <td>Avhilla Catton Andalucia</td><td>10231021</td><td>Lead DevOps</td></tr><tr>
            <td>Chelsy Olivia</td><td>10231025</td><td>Lead CI/CD & Deploy</td></tr><tr>
            <td>Betran</td><td>10231023</td><td>Lead QA & Docs</td></tr>
         </tbody>
        </table>
    
    </div>
  )
}
export default AboutPage