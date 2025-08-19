// 0시부터 24시까지 30분 간격의 시간 슬롯 생성
export const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
}