import '../../styles/problem.css'

export default function BookVehicle() {
    return (
        <section className="bookabus">
            <div className="problem__inner">
                <div className="problem__text">
                    <h2 className="problem__title">2. Book a vehicle and reserve a seat</h2>
                    <p className="problem__description">Once you are done selecting your route, 
                        pick any available vehicle passing going through it. Reserve a seat, and your done!
                        Just sit tight as you wait for the vehicle's arrival.
                        </p>
                </div>

                <div className="problem__image">
                    <img src="/images/city bus.svg" alt="..." />
                </div>
            </div>
        </section>
    )
}