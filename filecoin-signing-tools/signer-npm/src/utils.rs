use filecoin_signer::api::SignedMessageAPI;
use serde_json::json;
use wasm_bindgen::prelude::*;
#[cfg(target_arch = "wasm32")]
use {
    filecoin_signer_ledger::app::{Address, Signature},
    js_sys::Object,
};

// This defines the Node.js Buffer type
#[wasm_bindgen]
extern "C" {
    pub type Buffer;

    #[wasm_bindgen(constructor)]
    fn from(buffer_array: &[u8]) -> Buffer;
}

pub fn convert_to_lotus_signed_message(
    signed_message: SignedMessageAPI,
) -> Result<String, JsValue> {
    let signed_message_lotus = json!({
        "Message": {
            "To": signed_message.message.to,
            "From": signed_message.message.from,
            "Nonce": signed_message.message.nonce,
            "Value": signed_message.message.value,
            "GasLimit":signed_message.message.gas_limit,
            "GasPremium":signed_message.message.gas_premium,
            "GasFeeCap":signed_message.message.gas_fee_cap,
            "Method": signed_message.message.method,
            "Params": signed_message.message.params,
        },
        "Signature": {
            "Type": signed_message.signature.sig_type,
            "Data": base64::encode(signed_message.signature.data),
        }
    });

    Ok(signed_message_lotus.to_string())
}

/// Convert an address answer into a javascript object with proper buffer field
#[cfg(target_arch = "wasm32")]
pub fn address_to_object(address: &Address) -> Result<Object, JsValue> {
    let obj = js_sys::Object::new();
    js_sys::Reflect::set(
        &obj,
        &"publicKey".into(),
        &Buffer::from(&address.public_key.serialize().to_vec()),
    )?;
    js_sys::Reflect::set(
        &obj,
        &"addrString".into(),
        &JsValue::from_str(&address.addr_string),
    )?;
    js_sys::Reflect::set(
        &obj,
        &"addrByte".into(),
        &Buffer::from(&address.addr_byte.to_vec()),
    )?;
    Ok(obj)
}

/// Convert a signature answer into a javascript object with proper buffer field
#[cfg(target_arch = "wasm32")]
pub fn signature_to_object(signature: &Signature) -> Result<Object, JsValue> {
    let obj = js_sys::Object::new();
    js_sys::Reflect::set(
        &obj,
        &"signature_compact".into(),
        &Buffer::from(&signature.sig.serialize().to_vec()),
    )?;
    js_sys::Reflect::set(
        &obj,
        &"signature_der".into(),
        &Buffer::from(&signature.sig.serialize_der().as_ref().to_vec()),
    )?;
    js_sys::Reflect::set(&obj, &"r".into(), &Buffer::from(&signature.r))?;
    js_sys::Reflect::set(&obj, &"s".into(), &Buffer::from(&signature.s))?;
    js_sys::Reflect::set(&obj, &"v".into(), &JsValue::from(signature.v))?;
    Ok(obj)
}

#[cfg(target_arch = "wasm32")]
pub fn bytes_to_buffer(b: &[u8]) -> Buffer {
    Buffer::from(b)
}
