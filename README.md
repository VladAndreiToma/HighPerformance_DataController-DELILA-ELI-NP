# HighPerformance_DataController-DELILA-ELI-NP
 A High-Performance Monitoring System for DAQ at ELI NP using React.js with advanced tools (context parsing, nested routing) for seamless data flow, JSROOT API for data monitoring, and a Dockerized Node.js backend managing Grafana dashboards and CAEN/MESYTEC modules. Features gridding, data chunking, and automated logs.



# Detailed Explanation
This High-Performance Monitoring System for the DAQ setup at ELI NP combines advanced front-end and back-end technologies to deliver efficient data visualization, interaction, and control. The frontend is built with React.js, employing advanced tools such as context-based parsing and nested routing to ensure seamless data flow across components. Features like prop parsing further enhance the modularity and maintainability of the codebase, while HTML, CSS, and JavaScript create a polished and responsive user interface.

On the backend, Node.js powers API endpoints that handle server communication and control. The integration with JSROOT API, developed by CERN, brings advanced data monitoring and mathematical functionalities to the system. Using HTTP communication protocols, it retrieves and aggregates data from multiple servers, enabling users to analyze data chunks tailored to their needs. Features like gridding, dynamic visual effects, and customizable refresh options enhance the user experience.

The system also utilizes a Dockerized environment, managed through Node.js, to deploy Grafana dashboards and databases locally. It interacts with CAEN and MESYTEC electronic modules, providing real-time data retrieval and control. Automated log generation adds another layer of efficiency, documenting experimental activities for future reference.

