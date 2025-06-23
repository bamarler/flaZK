# flaZK

![alt text](image.png)

## Executive Summary

FlaZK is a zero-knowledge proof system that allows any platform to verify whether a user meets eligibility criteria, such as being over a certain age, holding a valid license, or maintaining a clean driving record, without revealing any personal information. FlaZK solves the growing compliance burden driven by laws like the UK Online Safety Act, which now mandates robust age verification or imposes severe financial penalties and service restrictions.

Today, websites and applications face an impossible choice: expose their users to invasive ID uploads and KYC scans or risk being geoblocked across entire regions like the UK, France, and EU. Meanwhile, privacy laws such as GDPR impose strict limitations on data collection, putting operators in legal limbo and driving user churn.

FlaZK eliminates this tradeoff by providing cryptographic age and license verification using zero-knowledge proofs (ZKPs). Our system allows users to prove they are eligible without revealing birthdate, name, location, or document contents. No data is ever stored, and proof verification is performed entirely client-side.

## How It Works

{:format :pointed-dict, :data [{#uuid "8284094e-ceb4-40df-80b3-a2c64afb81f1" {:entity-type :block, :coords {:y-start 0.17677346996437526, :x-start 0.05171086730497664, :x-end 0.7166061560858468, :y-end 0.7170875443743289}, :original-aspect-ratio? true, :media-asset-ids #{#uuid "80f306fc-0b71-4703-9add-ffa3432966e4"}, :image-aspect-ratio 2.187683284457478, :url "https://pitch-assets-ccb95893-de3f-4266-973c-20049231b248.s3.eu-west-1.amazonaws.com/80f306fc-0b71-4703-9add-ffa3432966e4?pitch-bytes=94850&pitch-content-type=image%2Fpng", :block-type :image, :image-scale-x 1, :locked-aspect-ratio? false, :created-at 1750569592061}} [#uuid "8284094e-ceb4-40df-80b3-a2c64afb81f1"]]}

A platform requests proof using a simple JSON policy (e.g., { "age_min": 25, "license_status": 1, "points_max": 6 }).

The user logs in with a phone number and uploads existing documents (e.g., license, insurance).

Our AI document scanner attempts to fulfill each requirement. If a field cannot be satisfied, the user is prompted to upload more documents.

Each new document is validated using trusted verification agents (e.g., government databases).

Once all fields are met, verified attributes are extracted (e.g., { "age": 26, "license_status": 1, "points": 4 }).

These values are passed to a ZK circuit and used to generate a single cryptographic proof.

The proof is returned to the client in the form { "proof": hash } and verified locally.

Result: Platforms confirm eligibility without accessing or storing any user data.

## Market Potential

Over 300M+ only users require age/license verification annually

Governments are mandating privacy-compliant verification (UK, EU, US)

Over $5B/year is spent on KYC & Compliance Tooling

The global compliance software market exceeds $50B, with a $500M addressable wedge
