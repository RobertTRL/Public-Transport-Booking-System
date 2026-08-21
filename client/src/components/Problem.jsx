import '../styles/problem.css'

export default function Problem() {
    return (
        <section className="problem">
            <div className="problem__inner">
                <div className="problem__text">
                    <h2 className="problem__title">Problem</h2>
                    <p className="problem__description">Ever wanted to view the route of a public service vehicle with stops? Or have you once tried boarding a vehicle only to be disappointed and infuriated when you see it is full? In such situations, did you ever wish that there was an easier way to reserve a seat, or view a route?</p>
                </div>

                <div className="problem__image">
                    <img src="/images/Questions.svg" alt="..." />
                </div>
            </div>
        </section>
    )
}