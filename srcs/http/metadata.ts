import express = require("express");
import { NftsLoader } from "../nfts";

var router = express.Router();

router.get('/:nft_id',async(req, res) => {
    try{
        const nfts = await NftsLoader.fetchNFTS();
        console.log(nfts[0])
        const nft = nfts.find((x: any) => x.nft_id === Number(req.params.nft_id))

        if (nft === undefined) {
            res.send({})
        }

        const metaData = {
            "name": `Cryptexos Planet "${nft.name}" #${nft.nft_id}`,    
            "description": `I am the Exoplanet "${nft.name}" in the Cryptexos Stellar Galactic collection, my rarity is ${nft.rarity}% !`,    
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Artist%E2%80%99s_impression_of_the_planet_Beta_Pictoris_b.jpg/1920px-Artist%E2%80%99s_impression_of_the_planet_Beta_Pictoris_b.jpg",    
            "attributes": [
                {
                    "trait_type": "Rarity",
                    "value": nft.rarity,
                    "display_type": "number"
                },
                {
                    "trait_type": "Discovered Age",
                    "value": (nft.discovered > 0) ? nft.discovered : "Unknown",
                    "display_type": "string"
                },
                {
                    "trait_type": "Mass",
                    "value": (nft.mass > 0) ? nft.mass : "Unknown",
                    "display_type": "string"
                },
                {
                    "trait_type": "Radius",
                    "value": (nft.radius > 0) ? nft.radius : "Unknown",
                    "display_type": "string"
                },
                {
                    "trait_type": "Orbital Period",
                    "value": (nft.orbital_period > 0) ? nft.orbital_period : "Unknown",
                    "display_type": "string"
                },
                {
                    "trait_type": "Mass*sin(i)",
                    "value": (nft.sini > 0) ? nft.sini : "Unknown",
                    "display_type": "string"
                },
            ]
          }
        res.send(metaData);

    }catch (error){
  
      console.log(error)
      return res.status(500).send();
    }
  })

  export default router;