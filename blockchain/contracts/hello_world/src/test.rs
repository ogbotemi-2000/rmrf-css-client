#![cfg(test)]

use super::*;
use soroban_sdk::{Env};

#[test]
fn test() {
    let env = Env::default();
    // let contract_id = env.register_contract(None, HelloContract);
    // let client = HelloContractClient::new(&env, &contract_id);

    // let words = client.hello(&symbol_short!("Dev"));
    // assert_eq!(
    //     words,
    //     vec![&env, symbol_short!("Hello"), symbol_short!("Dev"),]
    // );
    let contract_id = env.register_contract(None, Trim);
    let client = TrimClient::new(&env, &contract_id);
    log!(&env, "Address: {}", &contract_id);

    let void = client.job("https://google.com");

    assert_eq!(void, client.job("https://google.com"))
}
