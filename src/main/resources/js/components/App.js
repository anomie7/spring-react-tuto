import React from 'react';
import client from './client';
import EmployeeList from './EmployeeList';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {employees: []};
    }

    componentDidMount() {
        client({method: 'GET', path: '/api/employees'}).done(response => {
            this.setState({employees: response.entity._embedded.employees});
        } );
    }

    render(){
        return (
            <EmployeeList employees={this.state.employees} />
        )
    }
}

export default App;