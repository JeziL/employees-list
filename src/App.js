import Container from '@material-ui/core/Container';
import EmployeeTable from './EmployeeTable';
import Filters from './Filters';
import Footer from "./Footer";

function App() {
  return (
    <Container fixed>
      <Filters />
      <br />
      <EmployeeTable />
      <br />
      <Footer />
      <br />
    </Container>
  );
}

export default App;
