use reqwest;

// tokio let's us use "async" on our main function
#[tokio::main]
async fn main() {
    // chaining .await will yield our query result
    let result = reqwest::get("https://rmrf-css.vercel.app?url=https://google.com").await;

    println!("{:?}", result)
}
