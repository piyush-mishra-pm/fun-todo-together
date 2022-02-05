const loginForm = document.getElementById('login-form');
const feedback = document.getElementById('feedback');

loginForm.addEventListener('submit', loginCallback);

async function loginCallback(event) {
    event.preventDefault();

    feedback.innerHTML = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = await fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    }).then(res => res.json());

    //console.log(result);

    if (result.status === 'ok') {
        feedback.innerHTML='';
        localStorage.setItem('FTT-token', result.token);
        location.assign='/tasks'
        const redirectResponse = await fetch('/tasks', {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Content-Type': '',
                'Authorization': `Bearer ${localStorage.getItem('FTT-token')}`,
            },
        });
        console.log(redirectResponse);
        console.log(redirectResponse.body);
        console.dir(redirectResponse);
        window.location.href = redirectResponse.url;
        
    } 
    
    if(result.status==='error') {
        feedback.innerHTML=result.message;
    }
}