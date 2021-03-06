import React from 'react';
import client from './client';
import follow from './follow';
import when from 'when';
import EmployeeList from './EmployeeList';
import CreateDialog from './CreateDialog';

const root = '/api';

class App extends React.Component {
	
		constructor(props) {
			super(props);
			this.state = {employees: [], attributes: [], pageSize: 2, links: {}};
			this.updatePageSize = this.updatePageSize.bind(this);
			this.onCreate = this.onCreate.bind(this);
			this.onUpdate = this.onUpdate.bind(this);
			this.onDelete = this.onDelete.bind(this);
			this.onNavigate = this.onNavigate.bind(this);
		}
	
		// tag::follow-2[]
		loadFromServer(pageSize) {
			follow(client, root, [
				{rel: 'employees', params: {size: pageSize}}]
			).then(employeeCollection => {
				return client({
					method: 'GET',
					path: employeeCollection.entity._links.profile.href,
					headers: {'Accept': 'application/schema+json'}
				}).then(schema => {
					this.schema = schema.entity;
					this.links = employeeCollection.entity._links;
					return employeeCollection;
				});
			}).then(employeeCollection => {
				return employeeCollection.entity._embedded.employees.map(employee =>
						client({
							method: 'GET',
							path: employee._links.self.href
						})
				);
			}).then(employeePromises => {
				return when.all(employeePromises);
			}).done(employees => {
				this.setState({
					employees: employees,
					attributes: Object.keys(this.schema.properties),
					pageSize: pageSize,
					links: this.links
				});
			});
		}
		// end::follow-2[]
	
		// tag::create[]
		onCreate(newEmployee) {
			var self = this;
			follow(client, root, ['employees']).then(response => {
				return client({
					method: 'POST',
					path: response.entity._links.self.href,
					entity: newEmployee,
					headers: {'Content-Type': 'application/json'}
				})
			}).then(response => {
				return follow(client, root, [{rel: 'employees', params: {'size': self.state.pageSize}}]);
			}).done(response => {
				if (typeof response.entity._links.last != "undefined") {
					this.onNavigate(response.entity._links.last.href);
				} else {
					this.onNavigate(response.entity._links.self.href);
				}
			});
		}
		// end::create[]
	
		// tag::update[]
		onUpdate(employee, updatedEmployee) {
			client({
				method: 'PUT',
				path: employee.entity._links.self.href,
				entity: updatedEmployee,
				headers: {
					'Content-Type': 'application/json',
					'If-Match': employee.headers.Etag
				}
			}).done(response => {
				this.loadFromServer(this.state.pageSize);
			}, response => {
				if (response.status.code === 412) {
					alert('DENIED: Unable to update ' +
						employee.entity._links.self.href + '. Your copy is stale.');
				}
			});
		}
		// end::update[]
	
		// tag::delete[]
		onDelete(employee) {
			client({method: 'DELETE', path: employee.entity._links.self.href}).done(response => {
				this.loadFromServer(this.state.pageSize);
			});
		}
		// end::delete[]
	
		// tag::navigate[]
		onNavigate(navUri) {
			client({
				method: 'GET',
				path: navUri
			}).then(employeeCollection => {
				this.links = employeeCollection.entity._links;
	
				return employeeCollection.entity._embedded.employees.map(employee =>
						client({
							method: 'GET',
							path: employee._links.self.href
						})
				);
			}).then(employeePromises => {
				return when.all(employeePromises);
			}).done(employees => {
				this.setState({
					employees: employees,
					attributes: Object.keys(this.schema.properties),
					pageSize: this.state.pageSize,
					links: this.links
				});
			});
		}
		// end::navigate[]
	
		// tag::update-page-size[]
		updatePageSize(pageSize) {
			if (pageSize !== this.state.pageSize) {
				this.loadFromServer(pageSize);
			}
		}
		// end::update-page-size[]
	
		// tag::follow-1[]
		componentDidMount() {
			this.loadFromServer(this.state.pageSize);
		}
		// end::follow-1[]
	
		render() {
			return (
				<div>
					<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
					<EmployeeList employees={this.state.employees}
								  links={this.state.links}
								  pageSize={this.state.pageSize}
								  attributes={this.state.attributes}
								  onNavigate={this.onNavigate}
								  onUpdate={this.onUpdate}
								  onDelete={this.onDelete}
								  updatePageSize={this.updatePageSize}/>
				</div>
			)
		}
	}
	

export default App;