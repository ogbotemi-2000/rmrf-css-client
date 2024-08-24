#![no_std]

use soroban_sdk::{contractimpl, String};
use reqwest;


#[contractimpl]
impl Trim {
    // tokio let's us use "async" on our main function
    #[tokio::main]
    async fn result(url:String) -> String {
        // chaining .await will yield our query result
        let result = reqwest::get("http://localhost:3000/api/job?url="+url).await;
    
        println!("{:?}", result);
        result
    }
    // main("http://localhost:3000")
}

mod test;