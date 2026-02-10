import styled from 'styled-components';

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: #282c34;
	color: white;
	font-size: 2rem;
`;

function App() {
	return (
		<Container>
			<h1>Coditor Frontend</h1>
		</Container>
	);
}

export default App;