import "./homepage.css";

function Homepage() {
  return (
    <main className="home">
      <button className="btn-primary" onClick={() => console.log("clicked")}>
        Get Started
      </button>
    </main>
  );
}

export default Homepage;
