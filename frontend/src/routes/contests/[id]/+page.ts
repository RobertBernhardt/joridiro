import API from "../../../utils/API"

export async function load({ params }: any) {
    try {
        const res = await API.get(`/contest/${params.id}`, {})
        return {
            contest: res.data,
            score: res.score,
            rank: res.rank
        }
    } catch(err: any) {
        console.log(err)
    }

}