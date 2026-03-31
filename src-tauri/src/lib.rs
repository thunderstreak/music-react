#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            window_min,
            window_close,
            get_song_lyric,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use tauri::{command, WebviewWindow};

/// Minimize the main application window.
#[command]
async fn window_min(window: WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

/// Close the main application window.
#[command]
async fn window_close(window: WebviewWindow) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

/// Fetch song lyrics from QQ Music and return the raw lyric lines.
///
/// This replaces the Electron-side `ipcMain` + `request` logic in
/// `app/api/request.ts` so that the same functionality is available in the
/// Tauri build without requiring a separate Node.js main process.
#[command]
async fn get_song_lyric(song_id: String) -> Result<Vec<String>, String> {
    let url = format!(
        "https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?\
         callback=MusicJsonCallback_lrc&pcachetime=1494070301711\
         &songmid={}&g_tk=5381&jsonpCallback=MusicJsonCallback_lrc\
         &loginUin=0&hostUin=0&format=jsonp&inCharset=utf8\
         &outCharset=utf-8&notice=0&platform=yqq&needNewCode=0",
        song_id
    );

    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| e.to_string())?;

    let body = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36")
        .header("Accept", "*/*")
        .header("Referer", "https://y.qq.com/portal/player.html")
        .header("Accept-Language", "zh-CN,zh;q=0.8")
        .header("Host", "c.y.qq.com")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    // The response is JSONP; extract the JSON object inside the callback.
    let json_str = body
        .trim_start_matches("MusicJsonCallback_lrc(")
        .trim_end_matches(')')
        .trim_end_matches(';')
        .trim();

    let json: serde_json::Value =
        serde_json::from_str(json_str).map_err(|e| e.to_string())?;

    let lyric_b64 = json
        .get("lyric")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    if lyric_b64.is_empty() {
        return Ok(vec![]);
    }

    use base64::{engine::general_purpose, Engine as _};
    let decoded = general_purpose::STANDARD
        .decode(lyric_b64)
        .map_err(|e| e.to_string())?;
    let decoded_str = String::from_utf8(decoded).map_err(|e| e.to_string())?;

    // Strip the "[offset:0]" header that the JS side handled
    let lines: Vec<String> = decoded_str
        .splitn(2, "[offset:0]")
        .nth(1)
        .unwrap_or(&decoded_str)
        .lines()
        .map(|l| l.to_string())
        .collect();

    Ok(lines)
}

