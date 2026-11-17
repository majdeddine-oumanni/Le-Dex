export async function getCreatures() {
    try{

        let response = await fetch(`http://localhost:3000/creatures`);

        if(!response.ok){
            throw new Error("the fetch wasn't successful");
        }
 
        let data = await response.json(); 

        return data;

    }catch(error){
        console.error(error);
        return [];
    }
}

export async function research(name) {
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    
        if(!response.ok){
            throw new Error("the pokemon fetch wasn't successful");
        }

        const data = await response.json();

        let foundedCreature = {
            id: data.id,
            name: data.species.name,
            image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
            primaryType: data.types[0]?.type?.name || 'normal',
            totalStats: data.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
            HP: data.stats[0].base_stat,
            ATTACK: data.stats[1].base_stat,
            DEFENCE: data.stats[2].base_stat
        }
        return foundedCreature;
    }catch(error){
        console.error("error: " + error);
        return null;
    }
}