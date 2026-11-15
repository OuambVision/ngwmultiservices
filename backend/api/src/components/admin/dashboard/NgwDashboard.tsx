import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'

import './dashboard.scss'
import { loadDashboardData } from './loadDashboardData'

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} sur 5`} className="ngw-dash__stars">
      {'★★★★★'.slice(0, Math.max(0, Math.min(5, rating)))}
      <span className="ngw-dash__stars-empty">
        {'★★★★★'.slice(Math.max(0, Math.min(5, rating)))}
      </span>
    </span>
  )
}

function statusClass(status: string) {
  if (status === 'en_attente' || status === 'recue') return 'is-pending'
  if (status === 'confirmee' || status === 'publie' || status === 'traitee') return 'is-ok'
  if (status === 'terminee') return 'is-done'
  if (status === 'annulee' || status === 'refuse') return 'is-bad'
  return 'is-muted'
}

/** Tableau de bord maquette 10 — chiffres issus des collections. */
export async function NgwDashboard(props: AdminViewServerProps) {
  const { initPageResult } = props
  const { req } = initPageResult
  const data = await loadDashboardData(req.payload, req)
  const maxBar = Math.max(1, ...data.weekBars.map((bar) => bar.count))

  return (
    <div className="ngw-dash">
      <Gutter className="ngw-dash__wrap">
        <header className="ngw-dash__hero">
          <div>
            <h1 className="ngw-dash__title">Tableau de bord</h1>
            <p className="ngw-dash__subtitle">
              Bienvenue ! Voici un aperçu de l’activité de Ngw Multiservices.
            </p>
          </div>
          <div className="ngw-dash__range" title="Semaine civile en cours (Amérique/Toronto)">
            {data.weekLabel}
          </div>
        </header>

        <section aria-label="Indicateurs" className="ngw-dash__metrics">
          {data.metrics.map((metric) => (
            <article
              className={`ngw-dash__metric ngw-dash__metric--${metric.tone}`}
              key={metric.key}
            >
              <div className="ngw-dash__metric-top">
                <span className="ngw-dash__metric-label">{metric.label}</span>
                <span aria-hidden className="ngw-dash__metric-icon" />
              </div>
              <p className="ngw-dash__metric-value">{metric.value}</p>
              {metric.hint ? (
                <p className="ngw-dash__metric-hint">{metric.hint}</p>
              ) : (
                <p className="ngw-dash__metric-hint is-empty">—</p>
              )}
            </article>
          ))}
        </section>

        <div className="ngw-dash__grid">
          <div className="ngw-dash__main">
            <section className="ngw-dash__card">
              <div className="ngw-dash__card-head">
                <h2>Réservations récentes</h2>
                <a href="/admin/collections/bookings">Voir toutes</a>
              </div>
              {data.recentBookings.length === 0 ? (
                <p className="ngw-dash__empty">Aucune réservation pour le moment.</p>
              ) : (
                <div className="ngw-dash__table-wrap">
                  <table className="ngw-dash__table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Date et heure</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentBookings.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.name}</strong>
                          </td>
                          <td>
                            <span>{row.service}</span>
                            {row.category ? <small>{row.category}</small> : null}
                          </td>
                          <td>{row.when}</td>
                          <td>
                            <span className={`ngw-dash__pill ${statusClass(row.status)}`}>
                              {row.statusLabel}
                            </span>
                          </td>
                          <td>
                            <a
                              className="ngw-dash__link"
                              href={`/admin/collections/bookings/${row.id}`}
                            >
                              Ouvrir
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="ngw-dash__card">
              <div className="ngw-dash__card-head">
                <h2>Réservations de la semaine</h2>
              </div>
              <div
                className="ngw-dash__chart"
                role="img"
                aria-label="Réservations par jour de la semaine"
              >
                {data.weekBars.map((bar) => (
                  <div className="ngw-dash__bar" key={bar.key}>
                    <div className="ngw-dash__bar-track">
                      <div
                        className="ngw-dash__bar-fill"
                        style={{ height: `${Math.round((bar.count / maxBar) * 100)}%` }}
                        title={`${bar.count}`}
                      />
                    </div>
                    <span className="ngw-dash__bar-count">{bar.count}</span>
                    <span className="ngw-dash__bar-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="ngw-dash__aside">
            <section className="ngw-dash__card">
              <div className="ngw-dash__card-head">
                <h2>Actions rapides</h2>
              </div>
              <div className="ngw-dash__actions">
                <a
                  className="ngw-dash__btn ngw-dash__btn--primary"
                  href="/admin/collections/services/create"
                >
                  Ajouter un service
                </a>
                <a
                  className="ngw-dash__btn ngw-dash__btn--accent"
                  href="/admin/collections/realizations/create"
                >
                  Publier une réalisation
                </a>
                <a
                  className="ngw-dash__btn ngw-dash__btn--muted"
                  href="/admin/collections/reviews?where%5Bstatus%5D%5Bequals%5D=en_attente"
                >
                  Modérer les avis
                  {data.pendingReviewCount > 0 ? ` (${data.pendingReviewCount})` : ''}
                </a>
                <a
                  className="ngw-dash__btn ngw-dash__btn--ghost"
                  href="/admin/collections/quoteRequests"
                >
                  Voir les devis
                </a>
              </div>
            </section>

            <section className="ngw-dash__card">
              <div className="ngw-dash__card-head">
                <h2>Activité récente</h2>
              </div>
              {data.activity.length === 0 ? (
                <p className="ngw-dash__empty">Pas encore d’activité.</p>
              ) : (
                <ul className="ngw-dash__activity">
                  {data.activity.map((item) => (
                    <li key={item.id}>
                      <a href={item.href}>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                        <time>{item.when}</time>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="ngw-dash__card">
              <div className="ngw-dash__card-head">
                <h2>Avis en attente de modération</h2>
              </div>
              {data.pendingReviews.length === 0 ? (
                <p className="ngw-dash__empty">Aucun avis en attente.</p>
              ) : (
                <ul className="ngw-dash__reviews">
                  {data.pendingReviews.map((review) => (
                    <li key={review.id}>
                      {review.photo ? (
                        <img alt="" className="ngw-dash__review-photo" src={review.photo} />
                      ) : (
                        <span aria-hidden className="ngw-dash__review-photo is-empty" />
                      )}
                      <div>
                        <div className="ngw-dash__review-meta">
                          <strong>{review.author}</strong>
                          <Stars rating={review.rating} />
                        </div>
                        <p>{review.text || 'Sans texte'}</p>
                        <a className="ngw-dash__btn ngw-dash__btn--small" href={review.href}>
                          Modérer
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </Gutter>
    </div>
  )
}

export default NgwDashboard
