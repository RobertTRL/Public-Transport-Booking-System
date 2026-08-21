# Deadlines

- Account creation page
- Actual dashboard
- Login page (passengers, service operators)
- Footer
- Header 
- Main content
- Sidebar panel

- Homepage
- Navbar
- Map
- Search bar
- Profile section
-
-
 **To be completed by 21st August 11:59pm**

Norman - Add buttons within searchbar, use the sidebarbutton component. 
         Each button should have an icon and text, add a simple hover and onclick effect.
         Create buttons for the following items: 
              a) Overview, default button on load, takes someone to dashboard root onclick
              b) Vehicles, takes one to /vehicles subroute, 
              c) Routes, takes one to the /routes subroute,
              d) Bookings, takes one to the /bookings subroute,
              e) Stops, takes one to the /stops subroute
              f) Logout, logs a service provider out, for now click should navigate one to the /login page

         Go to main.jsx, add dashboard subroutes to /vehicles, /routes ,/bookings and /stops
         Style all buttons in one css file. Make the sidebarbutton component modular, takes only 3 props, icon, route and text
         For logout button, create a separate button within sidebar
         
Cabdi -  Create vehicles component, with a a table displaying a vehicle's number plate, route, capacity
and availability.
         Search bar where one can search for any vehicle with a field selected
         Create a routes component, with cards showing an image, size 400x400px(use an external APi to retrieve solid color images of size 400x400pixels), specific route. When the card is clicked, it should navigate the user to a dashboard subroute: /route/<route-name> and display tabular information about the vehicles using that route. Table should have following fields: number plate, route, capacity

         Style all components made using a single css file for each component
  
Marlene - Create bookings component, showing the following information: 
              a) Number of users who have booked in the current day(in a card)
              b) Number of users who booked across the week
              c) Average booking per day(in a card)
              d) Day with most bookings (in a card)
              - Note: The above infomration should be placed in one div, with the total users per week as the title
              e) Bar graph showing booking across the past week(use chart.js library)

        - Create Stops component, information is displayed as cards, each card should have 2 buttons: edit and remove. Also in the heading of the component, there should be an add stop button(style it but no functionality for now)

Vincent - Redesign of booking section of website. It should feature the following:
              a) Navbar with the following buttons: Home, Map, Activity, Profile. It should feature an icon and text arranged in a vertical manner
              b) Main section. 
              - Note: For smaller screens(<350px), navbar should be at near bottom of the screen, else it should be at top. Use react routing (In main.jsx) to create a subroute for booking with the following subroutes:
                     - / - index route, element is Homepage
                     - /map - element is Map
                     - /activity - element is activity
                     - /profile - element is profile, disregard Profilepage.jsx. Create a new one
               
        -  Redesign homepage.jsx to feature a searchbar that onsubmit, navigates to map section of booking page(implement logic but comment it out)
        - Style homepage.jsx well

Stephen - Add map preview(use leaflet.js as map) , add logic showing all stops and routes within the map
        - Redesign map.jsx so that locations shown are taken as props