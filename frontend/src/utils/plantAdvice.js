export function getPlantAdvice(question) {
  if (!question.trim()) {
    return "";
  }

  const text = question.toLowerCase();

    if (text.includes("yellow")) {
        return `Possible causes:
            • Overwatering
            • Lack of sunlight
            • Nutrient deficiency`;
    }

    if (text.includes("water")) {
        return `Watering advice:
            • Water only when soil feels dry
            • Avoid overwatering`;
    }

    if (text.includes("sun")) {
        return `Sunlight advice:
            • Most indoor plants prefer indirect sunlight`;
    }

    return "PlantPal is still learning 🌱";
}