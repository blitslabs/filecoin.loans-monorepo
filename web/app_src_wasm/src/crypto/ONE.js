import { HarmonyAddress } from '@harmony-js/crypto'
import { HarmonyExtension } from '@harmony-js/core'

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const ONE = {
    isAddressValid: (address) => {
        try {
            return HarmonyAddress.isValidBech32(address)
        } catch (e) {
            return false
        }
    },

    getAccount: async () => {
       
        if (!window.onewallet) {
            setTimeout(ONE.getAccount(), 500)
            return
        }
       
        try {
            const harmony = new HarmonyExtension(window.onewallet)            
            const account = await harmony.login()            
            return { status: 'OK', payload: account }

        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error connecting Harmony provider' }
        }
    }
}

export default ONE