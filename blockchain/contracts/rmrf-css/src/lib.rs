// #![no_std]

use soroban_sdk::{contract, contractimpl, String};
use reqwest;

#[contract]
pub struct Trim;

#[contractimpl]
impl Trim {

}
// tokio let's us use "async" on our main function
#[tokio::main]
async fn main(/*_url:&String*/) /*-> String*/ {
    // chaining .await will yield our query result
    let result = reqwest::get("http://localhost:3000/api/job?url=https://google.com").await;

    println!("{:?}", result);
    // result
}

// mod test;