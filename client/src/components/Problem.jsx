import '../styles/problem.css'

export default function Problem() {
    return (
        <section className="problem">
            <div className="problem__inner">
                <div className="problem__text">
                    <h2 className="problem__title">Problem</h2>
                    <p className="problem__description">
                        Describe the problem your product solves here — keep it tight, 2-3 sentences max so it doesn't overpower the visual.
                    </p>
                </div>

                <div className="problem__image">
                    <img src="/images/Questions.svg" alt="..." />
                </div>
            </div>
        </section>
    )
}