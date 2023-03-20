/**
 * @jest-environment jsdom
 */
// debugger;

import { fireEvent, getAllByTestId, getByTestId, getByClassName, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
// import { ROUTES_PATH} from "../constants/routes.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore);

beforeEach(() => {
   Object.defineProperty(window, "localStorage", { value: localStorageMock });
   window.localStorage.setItem(
      "user",
      JSON.stringify({
         type: "Employee",
         email: "employee@test.tld",
         status: "connected",
      })
   );
   const root = document.createElement("div");
   root.setAttribute("id", "root");
   document.body.append(root);
   router();
   window.onNavigate(ROUTES_PATH.Bills);
});

afterEach(() => {
   jest.clearAllMocks();
});

describe("Given I am connected as an employee", () => {
   describe("When I am on Bills page, I click on the icon eye", () => {
      test("Then a modal should appear", async () => {
         await waitFor(() => screen.getAllByTestId("icon-eye"));
         const eye = screen.getAllByTestId("icon-eye");

         const firstEye = eye[0];
         $.fn.modal = jest.fn();

         userEvent.click(firstEye)

         const dialog = await screen.findByRole("dialog", { hidden: true });
         expect(dialog).toBeTruthy();
      });
   });

   describe("When I am on Bills page, I click on the button New Bill", () => {
      test("Then, should render the Add a New Bill Page", async () => {
         await waitFor(() => screen.getByTestId("btn-new-bill"));
         const btn = screen.getByTestId("btn-new-bill");
         userEvent.click(btn);
         expect(await screen.findByText("Envoyer une note de frais")).toBeTruthy();
      });
      test("Then bill icon in vertical layout should be highlighted", async () => {
         document.location = "/#employee/bill/new";
         await router();
         await waitFor(() => screen.getByTestId("icon-mail"));
         const windowIcon = screen.getByTestId("icon-mail");
         expect(windowIcon.classList.contains("active-icon")).toBe(true);
      });
   });
});


