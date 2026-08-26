export function getClimateColor(latitude: number): string {
  if (latitude > 60 || latitude < -60) {
    return "#A9CCE3";
  }
  if (
    (latitude > 30 && latitude < 60) ||
    (latitude > -60 && latitude < -30)
  ) {
    return "#A2D9CE";
  }
  if (
    (latitude > 10 && latitude < 30) ||
    (latitude > -30 && latitude < -10)
  ) {
    return "#F9E79F";
  }
  return "#ABEBC6";
}
