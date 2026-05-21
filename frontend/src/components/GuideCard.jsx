function GuideCard({icon, title, content}) {
    return (
        <div className="guide-card">
            <h3>{icon} {title}</h3>
            <p>{content}</p>
        </div>

    )
}

export default GuideCard;