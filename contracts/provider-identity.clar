;; Provider Identity Contract
;; Manages healthcare practitioner identities

;; Define data variables
(define-data-var contract-owner principal tx-sender)

;; Define data maps
(define-map providers
  { provider-id: (string-utf8 36) }
  {
    principal: principal,
    full-name: (string-utf8 100),
    specialty: (string-utf8 50),
    npi-number: (string-utf8 10),
    active: bool,
    created-at: uint,
    updated-at: uint
  }
)

;; Define principal to provider-id mapping
(define-map principal-to-provider-id
  { principal: principal }
  { provider-id: (string-utf8 36) }
)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u1)
(define-constant ERR-PROVIDER-EXISTS u2)
(define-constant ERR-PROVIDER-NOT-FOUND u3)
(define-constant ERR-INVALID-INPUT u4)

;; Read-only functions

;; Get provider details by ID
(define-read-only (get-provider (provider-id (string-utf8 36)))
  (map-get? providers { provider-id: provider-id })
)

;; Get provider ID by principal
(define-read-only (get-provider-id-by-principal (provider-principal principal))
  (map-get? principal-to-provider-id { principal: provider-principal })
)

;; Check if provider exists
(define-read-only (provider-exists (provider-id (string-utf8 36)))
  (is-some (map-get? providers { provider-id: provider-id }))
)

;; Public functions

;; Register a new provider
(define-public (register-provider
    (provider-id (string-utf8 36))
    (full-name (string-utf8 100))
    (specialty (string-utf8 50))
    (npi-number (string-utf8 10)))
  (let ((current-time (get-block-info? time (- block-height u1))))
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (provider-exists provider-id)) (err ERR-PROVIDER-EXISTS))
    (asserts! (> (len full-name) u0) (err ERR-INVALID-INPUT))

    (map-set providers
      { provider-id: provider-id }
      {
        principal: tx-sender,
        full-name: full-name,
        specialty: specialty,
        npi-number: npi-number,
        active: true,
        created-at: (default-to u0 current-time),
        updated-at: (default-to u0 current-time)
      }
    )

    (map-set principal-to-provider-id
      { principal: tx-sender }
      { provider-id: provider-id }
    )

    (ok provider-id)
  )
)

;; Update provider information
(define-public (update-provider
    (provider-id (string-utf8 36))
    (full-name (string-utf8 100))
    (specialty (string-utf8 50))
    (npi-number (string-utf8 10)))
  (let (
    (provider-data (unwrap! (map-get? providers { provider-id: provider-id }) (err ERR-PROVIDER-NOT-FOUND)))
    (current-time (get-block-info? time (- block-height u1)))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (> (len full-name) u0) (err ERR-INVALID-INPUT))

    (map-set providers
      { provider-id: provider-id }
      (merge provider-data {
        full-name: full-name,
        specialty: specialty,
        npi-number: npi-number,
        updated-at: (default-to u0 current-time)
      })
    )

    (ok provider-id)
  )
)

;; Deactivate a provider
(define-public (deactivate-provider (provider-id (string-utf8 36)))
  (let (
    (provider-data (unwrap! (map-get? providers { provider-id: provider-id }) (err ERR-PROVIDER-NOT-FOUND)))
    (current-time (get-block-info? time (- block-height u1)))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))

    (map-set providers
      { provider-id: provider-id }
      (merge provider-data {
        active: false,
        updated-at: (default-to u0 current-time)
      })
    )

    (ok provider-id)
  )
)

;; Reactivate a provider
(define-public (reactivate-provider (provider-id (string-utf8 36)))
  (let (
    (provider-data (unwrap! (map-get? providers { provider-id: provider-id }) (err ERR-PROVIDER-NOT-FOUND)))
    (current-time (get-block-info? time (- block-height u1)))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))

    (map-set providers
      { provider-id: provider-id }
      (merge provider-data {
        active: true,
        updated-at: (default-to u0 current-time)
      })
    )

    (ok provider-id)
  )
)

