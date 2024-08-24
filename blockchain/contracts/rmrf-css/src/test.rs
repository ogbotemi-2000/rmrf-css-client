#![cfg(test)]

// use super::{IncrementContract, IncrementContractClient};
use super::*;
use soroban_sdk::{testutils::Logs, Env};

extern crate std;

#[test]
fn test() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Trim);
    let trim = TrimClient::new(&env, &contract_id);

    assert_eq!(trim.result("http://localhost:3000"), trim.result("http://localhost:3000"));

    std::println!("{}", env.logs().all().join("\n"));
}
