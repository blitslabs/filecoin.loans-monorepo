/*******************************************************************************
*   (c) 2020 ZondaX GmbH
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
********************************************************************************/
//! Support library for Filecoin Ledger Nano S/X apps

#![cfg_attr(not(test), deny(clippy::unwrap_used, clippy::expect_used,))]
#![deny(warnings, trivial_casts, trivial_numeric_casts)]
#![deny(unused_import_braces, unused_qualifications)]
#![deny(missing_docs)]
#![doc(html_root_url = "https://docs.rs/ledger-filecoin/0.1.0")]

mod params;

#[cfg(target_arch = "wasm32")]
pub use ledger_transport::TransportWrapperTrait;
pub use ledger_transport::{APDUAnswer, APDUCommand, APDUErrorCodes, APDUTransport};
/// Ledger related errors
pub use ledger_zondax_generic::LedgerAppError;

/// Filecoin app
pub mod app;

#[cfg(test)]
mod tests {}
