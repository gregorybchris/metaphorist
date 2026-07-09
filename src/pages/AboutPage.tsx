import { GithubLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const GITHUB_URL = "https://github.com/gregorybchris/metaphorist";

const CITATIONS = [
  {
    text: (
      <>
        Lakoff, George, and Mark Johnson. 1980. <em>Metaphors We Live By</em>.
        Chicago: University of Chicago Press.
      </>
    ),
  },
  {
    text: (
      <>
        Dodge, Ellen, Jisup Hong, and Elise Stickles. 2015. “MetaNet: Deep
        semantic automatic metaphor analysis.” In{" "}
        <em>Proceedings of the Third Workshop on Metaphor in NLP</em>, 40–49.
        Denver, Colorado: Association for Computational Linguistics.
      </>
    ),
  },
  {
    text: (
      <>
        Lakoff, George, Jane Espenson, and Alan Schwartz. 1991.{" "}
        <em>Master Metaphor List</em>, 2nd draft copy. Berkeley: Cognitive
        Linguistics Group, University of California, Berkeley.
      </>
    ),
  },
  {
    text: (
      <>
        David, Oana. 2017. “Computational approaches to metaphor: The case of
        MetaNet.” In <em>The Cambridge Handbook of Cognitive Linguistics</em>,
        edited by Barbara Dancygier, 574–589. Cambridge: Cambridge University
        Press.
      </>
    ),
  },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <p className="font-serif text-2xl text-text sm:text-3xl">
        About this project
      </p>

      <div className="mt-6 space-y-4 text-pretty leading-relaxed text-text-muted">
        <p>
          This project explores Conceptual Metaphor Theory (Lakoff & Johnson):
          the idea that we understand abstract concepts (theories, ideas, time,
          life) systematically in terms of more concrete ones (buildings, food,
          money, journeys), and that this shows up as everyday patterns in
          language.
        </p>
      </div>

      <div className="mt-10">
        <p className="font-serif text-lg text-text">Get the data</p>
        <p className="mt-2 text-sm text-text-muted">
          The full dataset is open source. Browse or download it from the
          GitHub repository.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm text-text-muted underline hover:text-text"
        >
          <GithubLogo className="h-4 w-4" weight="fill" />
          gregorybchris/metaphorist
        </a>
      </div>

      <div className="mt-10">
        <p className="font-serif text-lg text-text">Citing this data</p>
        <p className="mt-2 text-sm text-text-muted">
          This dataset derives from the MetaNet Metaphor Repository and the
          Master Metaphor List. If you use this data, please cite the underlying
          sources:
        </p>
        <ul className="mt-4 space-y-4">
          {CITATIONS.map((citation, i) => (
            <li
              key={i}
              className="border-l-2 border-border pl-4 text-sm leading-relaxed text-text-muted"
            >
              {citation.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <Link
          to="/metaphors"
          className="text-sm text-text-muted underline hover:text-text"
        >
          Back to the metaphors
        </Link>
      </div>
    </div>
  );
}
