#![no_std]
use soroban_sdk::{contract, contractimpl, Env, log, String};

extern crate alloc;
use hyper_rustls;

#[contract]
pub struct Trim;

#[contractimpl]
impl Trim {

  pub async fn job(env: Env, url:String) {
		// let client = hyper::upgrade::new();

		let route = alloc::format!("https://rmrf-css.vercel.app/api/get?url={:?}!", url);
		log!(&env, "Route: {}", route);

		let conn = hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .https_or_http()
        .enable_http1()
        .build();

    let client = hyper::Client::builder().build::<_, hyper::Body>(conn);

    let response = client
        .get(route.parse().unwrap())
        .await
        .unwrap();

    let body = String::from_utf8(
        hyper::body::to_bytes(response.into_body())
            .await
            .unwrap()
            .to_vec(),
    )
    .unwrap();
  }
	log!(&env, "Body: {}", body);
}

// #[test]
// fn test() {
//     let env = Env::default();
//     let contract_id = env.register_contract(None, Trim);
//     let client = TrimClient::new(&env, &contract_id);
//     log!(&env, "Address: {}", &contract_id);

//     let void = client.job();

//     assert_eq!(void, client.job());
// }
