import "./homepage.css";

function Homepage() {
  return (
    <main className="home">
      <h1>Welcome</h1>
      <button className="btn-primary" onClick={() => console.log("clicked")}>
        Get Started
      </button>
    </main>
  );
}

export default Homepage;
