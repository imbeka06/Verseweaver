const fighters = [
  {
    id: 'ice-warden',
    image:
      'https://images.unsplash.com/photo-1536766768598-e09213fdcf22?auto=format&fit=crop&w=950&q=80',
    className: 'duel-fighter--ice',
  },
  {
    id: 'ember-ronin',
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=950&q=80',
    className: 'duel-fighter--ember',
  },
]

function DuelScene3D() {
  return (
    <section className="duel-stage" aria-hidden="true">
      <div className="duel-stage__banner" />

      <div className="duel-stage__ring" />

      <div className="duel-stage__fighters">
        {fighters.map((fighter) => (
          <figure key={fighter.id} className={['duel-fighter', fighter.className].join(' ')}>
            <img src={fighter.image} alt="" className="duel-fighter__image" loading="eager" />
          </figure>
        ))}
      </div>

      <div className="duel-stage__impact" />

      <div className="duel-stage__headline">
        <p>PROVE YOUR FATE IN THE ARENA.</p>
        <p>THEN CRAFT YOUR LEGEND.</p>
        <small>Visual Pre-Visualization and Inspiration Lab</small>
      </div>
    </section>
  )
}

export default DuelScene3D
