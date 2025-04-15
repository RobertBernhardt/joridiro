import API from "../../utils/API"
export async function load({ params }: any) {
    try{
        const res = await API.get('/contest?page=1', {})
        return {
            contests: res.data ? res.data : []
        }
    } catch {
        return {
            contests: []
        }
    }
}