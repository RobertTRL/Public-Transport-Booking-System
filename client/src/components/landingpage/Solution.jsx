import '../../styles/problem.css'

export default function Solution() {
    return (
        <section className="problem">
            <div className="problem__inner">

                <div className="problem__image">
                    <img src="/images/Team goals-cuate.svg" alt="..." />
                </div>

                <div className="problem__text">
                    <h2 className="problem__title">Worry no more,</h2>
                    <p className="problem__description">We, as Hop On! have crafted a solution to your problem.
                        We have implemented a <strong>Public Transport Booking System</strong> where you 
                        can <strong>view route maps and stops</strong>, look up and <strong>reserve</strong> seats for available buses 
                        going through your desired routes. Additionally, service operators can <strong>add stops for routes</strong> and manage the routes they operate in. 
                    </p>
                </div>

            </div>
        </section>
    )
}