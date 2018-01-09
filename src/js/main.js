const fetchData = async () => {
    const response = await fetch('http://jsonplaceholder.typicode.com/users');
    const data = await response.json();
    return data;
}

fetchData().then(data => console.table(data));
