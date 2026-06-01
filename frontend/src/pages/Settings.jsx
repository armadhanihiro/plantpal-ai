function Settings({ user }) {
    return (
        <div className="settings-page">
            <h1>Settings ⚙️</h1>

            <p className="settings-intro">
                Manage your PlantPal AI experience.
            </p>

            <div className="settings-card">
                <h3>Account</h3>
                <div className="setting-row">
                    <span>Email</span>
                    <strong>{user?.email}</strong>
                </div>
            </div>


            <div className="settings-card">
                <h3>PlantPal AI 🌱</h3>
                <div className="setting-row">
                    <span>Version</span>
                    <strong>1.1.0</strong>
                </div>

                <div className="setting-row">
                    <span>Status</span>
                    <strong>Active</strong>
                </div>
            </div>


            <div className="settings-card">
                <h3>Features</h3>
                <ul>
                    <li>🌱 AI Plant Detection</li>
                    <li>💬 Smart Plant Chat</li>
                    <li>📊 Health Analysis</li>
                    <li>🪴 Plant Journey</li>
                    <li>🛡️ Non-plant Image Protection</li>
                </ul>
            </div>


            <div className="settings-card">
                <h3>About</h3>
                <p>
                    PlantPal AI is your personal plant companion,
                    helping you understand, track, and care for your plants.
                </p>
            </div>
        </div>
    );
}

export default Settings;