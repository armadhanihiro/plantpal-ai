function About() {
    return (
        <div className="settings-page">
            <h1>About PlantPal 🌱</h1>
            <p className="about-intro">
                PlantPal AI is designed to help plant lovers
                understand and care for their plants through
                a simple and friendly experience.
            </p>
            <div className="settings-card">
                <h3>Our Mission</h3>
                <p>Make plant care easier and more accessible with smart technology.</p>
            </div>
            <div className="settings-card">
                <h3>Current Features</h3>
                <ul>
                    <li>Upload plant images</li>
                    <li>Plant health score</li>
                    <li>Plant information</li>
                    <li>Care guide tips</li>
                    <li>Question history</li>
                </ul>
            </div>

        </div>
    );
}

export default About;