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

    console.log(result);

    // If login is successful then store the JWT token in cookies for future requests which need authentication.
    // Then we refresh the page.
    if (result.status === 'ok') {
        feedback.innerHTML='';
        // Storing the JWT token in cookies automatically happens by server's response in login and signup
        // Finally reloadding the page and let the default routers which permit authenticated users carry us to the tasks page.
        location.reload();
    } 
    else if(result.status==='error') {
        feedback.innerHTML=result.message;
    }
}