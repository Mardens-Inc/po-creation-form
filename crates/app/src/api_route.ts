import {invoke} from "@tauri-apps/api/core";

export async function getApiRoute():Promise<string>{
    return invoke("get_api_url")
}