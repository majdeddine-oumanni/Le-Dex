const apiUrl = "http://localhost:3000/creatures"

export async function getCreatures() {
    try{

        let response = await fetch(apiUrl);

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
        const response = await fetch(`${apiUrl}/${name}`);
    
        if(!response.ok){
            throw new Error("the pokemon fetch wasn't successful");
        }

        const data = await response.json();

        return data;
    }catch(error){
        console.error("error: " + error);
        return null;
    }
}

export const filterByType = async (type) =>{
    try{
        const response = await fetch(`${apiUrl}?primaryType=${type}`);
    
        if(!response.ok){
            throw new Error("the pokemon fetch wasn't successful");
        }

        const data = await response.json();

        return data;
    }catch(error){
        console.error("error: " + error);
        return null;
    }
}


export const postCreature = async (creature)=>{
    try{
        const response = await fetch(apiUrl, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(creature)
            }
        )
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();

    }catch(error){
        console.error("Error : " + error);
    }
}