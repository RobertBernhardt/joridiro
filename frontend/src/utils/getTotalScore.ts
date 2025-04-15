const calcScore = (participant: any) => {
    if(!participant) return 0
    return participant?.score.reduce((acc: any, cur: any) => {
        return acc + cur.points
    }, 0)
}

export {
    calcScore
}